import { SignIn } from "@clerk/nextjs";
import Nav from "../../components/nav";

export default function Page() {
  return (
    <main>
      <h1>Sign In</h1>
      <Nav />
      <SignIn />
    </main>
  );
}
