import Login from "../components/auth/login";
import PageSEO from "../components/common/PageSEO";

const login = () => {
  return (
    <>
      <PageSEO />
      <section>
        <Login />
      </section>
    </>
  );
};

export default login;
