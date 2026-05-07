function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

const getTokenFromCookie = () => {
  const token = getCookie("token");
  return token || 'hello';
};

export { getTokenFromCookie };