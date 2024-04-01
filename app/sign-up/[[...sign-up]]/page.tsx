import { SignUp } from "@clerk/nextjs";
import Nav from "../../components/nav";

export default function Page() {
  return (
    <main>
      <h1>Sign Up</h1>
      <Nav />
      <SignUp />
    </main>
  );
}
