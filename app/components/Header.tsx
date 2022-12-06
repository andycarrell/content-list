import type { ReactNode } from "react";
import { Form } from "@remix-run/react";
import { cx, useUser } from "~/utils";

type Props = {
  title: ReactNode;
};

export function Header({ title }: Props) {
  const user = useUser();

  return (
    <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
      <h1
        className={cx(
          "bg-gradient-to-r from-pink-500 to-violet-500",
          "bg-clip-text text-transparent",
          "text-3xl font-bold "
        )}
      >
        {title}
      </h1>
      <p>{user.email}</p>
      <Form action="/logout" method="post">
        <button
          type="submit"
          className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
        >
          Logout
        </button>
      </Form>
    </header>
  );
}
