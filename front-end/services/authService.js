export const loginUser = async ({ identifier, password }) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (identifier === 'faceattend@gmail.com' && password === '7891') {
    return {
      success: true,
      user: {
        name: 'Jonattan Rizo',
        email: 'faceattend@gmail.com',
      },
    };
  }

  return {
    success: false,
    message: 'Credenciales inválidas',
  };
};