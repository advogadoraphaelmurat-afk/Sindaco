import "@testing-library/jest-dom";

// Mock de cookies de Next.js (next/headers)
// Em Next.js 15/16, cookies() retorna uma Promise que resolve para o cookie store
jest.mock("next/headers", () => {
  const mockCookieStore = {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  };
  return {
    cookies: jest.fn().mockImplementation(() => Promise.resolve(mockCookieStore)),
  };
});

// Mock de redirecionamento e roteamento do Next.js (next/navigation)
jest.mock("next/navigation", () => {
  return {
    redirect: jest.fn((url: string) => {
      // Simula o comportamento padrão do Next.js que lança um erro digest para redirecionar
      const error = new Error("NEXT_REDIRECT") as any;
      error.digest = `NEXT_REDIRECT;307;${url};false;`;
      throw error;
    }),
  };
});

// Mock de revalidação de cache do Next.js (next/cache)
jest.mock("next/cache", () => {
  return {
    revalidatePath: jest.fn(),
    revalidateTag: jest.fn(),
  };
});
