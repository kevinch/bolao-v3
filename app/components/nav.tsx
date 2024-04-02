import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default function Nav() {
  return (
    <nav>
      <UserButton />
      <ul>
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          {" "}
          <Link href="/about">About</Link>
        </li>
        <li>
          <Link href="/sign-in">Sign-in</Link>
        </li>
        <li>
          <Link href="/sign-up">Sign-up</Link>
        </li>
        <li>
          <Link href="/profile">Profile</Link>
        </li>
      </ul>
    </nav>
  );
}
