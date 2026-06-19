const { SignJWT, jwtVerify } = require('jose');

const secretKey = process.env.JWT_SECRET || "super-secret-sindaco-key";
const key = new TextEncoder().encode(secretKey);

async function encrypt(payload) {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key);
}

async function decrypt(input) {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload;
}

async function run() {
  const token = await encrypt({
    userId: '123',
    role: 'SINDICO',
    buildingId: 'abc',
    email: 'test@test.com'
  });
  const decrypted = await decrypt(token);
  console.log('Decrypted:', decrypted);
}

run();
