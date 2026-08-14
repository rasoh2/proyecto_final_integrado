const request = require("supertest");
const { app, sequelize } = require("../../index");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

describe("💰 AlkeWallet - Suite de Calidad y Pruebas (@bank-qa)", () => {
  let userA, userB;
  let tokenA, tokenB;

  // Generar correos electrónicos únicos para evitar colisiones
  const emailA = `test_sender_${Date.now()}@alkewallet.cl`;
  const emailB = `test_receiver_${Date.now()}@alkewallet.cl`;

  beforeAll(async () => {
    // Asegurar que la conexión a la base de datos esté lista
    await sequelize.authenticate();
  });

  afterAll(async () => {
    // Limpieza: Eliminar usuarios de prueba y sus transacciones de la base de datos
    if (userA && userB) {
      await Transaction.destroy({
        where: {
          sender_id: [userA.id, userB.id],
        },
      });
      await Transaction.destroy({
        where: {
          receiver_id: [userA.id, userB.id],
        },
      });
      await User.destroy({
        where: {
          id: [userA.id, userB.id],
        },
      });
    }
    // Cerrar conexión
    await sequelize.close();
  });

  test("AC-008: Registrar dos usuarios de prueba con saldo inicial de 1M", async () => {
    // Registrar Usuario A
    const resRegA = await request(app)
      .post("/api/v1/usuarios/registro")
      .send({
        nombre: "Test User A",
        correo: emailA,
        password: "password123",
      });
    expect(resRegA.status).toBe(201);

    // Registrar Usuario B
    const resRegB = await request(app)
      .post("/api/v1/usuarios/registro")
      .send({
        nombre: "Test User B",
        correo: emailB,
        password: "password123",
      });
    expect(resRegB.status).toBe(201);

    // Loguear Usuario A
    const resLogA = await request(app)
      .post("/api/v1/usuarios/login")
      .send({
        correo: emailA,
        password: "password123",
      });
    expect(resLogA.status).toBe(200);
    tokenA = resLogA.body.data.token;
    userA = resLogA.body.data.usuario;

    // Loguear Usuario B
    const resLogB = await request(app)
      .post("/api/v1/usuarios/login")
      .send({
        correo: emailB,
        password: "password123",
      });
    expect(resLogB.status).toBe(200);
    tokenB = resLogB.body.data.token;
    userB = resLogB.body.data.usuario;

    expect(parseFloat(userA.saldo)).toBe(1000000);
    expect(parseFloat(userB.saldo)).toBe(1000000);
  });

  test("AC-009: Realizar transferencia simple entre A y B", async () => {
    const resTransfer = await request(app)
      .post("/api/v1/transacciones/transferencia")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        receiver_correo: emailB,
        monto: 50000.0, // Transferir $50.000 CLP
      });

    expect(resTransfer.status).toBe(200);
    expect(resTransfer.body.status).toBe("success");
    expect(parseFloat(resTransfer.body.data.tuNuevoSaldo)).toBe(950000.0);
  });

  test("AC-009 (Evitar Deadlocks): Ejecutar transferencias cruzadas simultáneas de forma concurrente", async () => {
    // Simular que el Usuario A envía 10.000 a B, y el Usuario B envía 15.000 a A simultáneamente
    const promise1 = request(app)
      .post("/api/v1/transacciones/transferencia")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        receiver_correo: emailB,
        monto: 10000.0,
      });

    const promise2 = request(app)
      .post("/api/v1/transacciones/transferencia")
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        receiver_correo: emailA,
        monto: 15000.0,
      });

    // Ejecutar ambas promesas al mismo tiempo
    const [res1, res2] = await Promise.all([promise1, promise2]);

    // Verificar que ambas solicitudes hayan sido exitosas y que no se haya lanzado bloqueo mutuo
    expect([200, 201]).toContain(res1.status);
    expect([200, 201]).toContain(res2.status);

    expect(res1.body.status).toBe("success");
    expect(res2.body.status).toBe("success");

    // Verificar saldos actualizados en base de datos
    const updatedUserA = await User.findByPk(userA.id);
    const updatedUserB = await User.findByPk(userB.id);

    // Saldo inicial de A tras la primera prueba = 950.000
    // Envía 10.000 a B y recibe 15.000 de B => Saldo final esperado = 955.000
    expect(parseFloat(updatedUserA.saldo)).toBe(955000.0);

    // Saldo inicial de B tras la primera prueba = 1.050.000
    // Recibe 10.000 de A y envía 15.000 a A => Saldo final esperado = 1.045.000
    expect(parseFloat(updatedUserB.saldo)).toBe(1045000.0);
  });
});
