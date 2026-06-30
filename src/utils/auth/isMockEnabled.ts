export const isMockAuthEnabled = (): boolean => {
  console.log(
    "disable flag:",
    localStorage.getItem("PLAYWRIGHT_DISABLE_MOCK_AUTH")
  );

  console.log(
    "env:",
    import.meta.env.VITE_MOCK_AUTH
  );


  return (
    import.meta.env.VITE_MOCK_AUTH === "true" &&
    localStorage.getItem("PLAYWRIGHT_DISABLE_MOCK_AUTH") !== "true"
  );
};