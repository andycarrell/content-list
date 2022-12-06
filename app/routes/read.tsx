import { useEffect, useRef } from "react";
import { Link, Form, useTransition } from "@remix-run/react";
import type { ActionFunction, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireUserId } from "~/session.server";
import { Header } from "~/components/Header";
import { cx } from "~/utils";

export const action: ActionFunction = async ({ request }) => {
  await requireUserId(request);

  const formData = await request.formData();
  const link = formData.get("link");

  if (typeof link !== "string" || link.length === 0) {
    return json({ errors: { link: "Link is required" } }, { status: 400 });
  }

  // TODO: save and return new content
  return null;
};

export async function loader({ request }: LoaderArgs) {
  await requireUserId(request);

  // TODO: load data
  return {};
}

export default function Read() {
  const transition = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (
      transition.state !== "submitting" &&
      transition.submission?.formData?.get("_action") === "create"
    ) {
      formRef.current?.reset();
      inputRef.current?.focus();
    }
  }, [transition]);

  return (
    <div className="flex min-h-full flex-col justify-start">
      <Header title={<Link to=".">Read</Link>} />
      <div className="grid grid-cols-[40px_auto_40px] py-10">
        <Form
          method="post"
          replace
          ref={formRef}
          className="group col-start-2 col-end-3 grid grid-cols-[auto_max-content_max-content] gap-4"
        >
          <label>
            <span className="sr-only">Content link</span>
            <input
              name="link"
              ref={inputRef}
              placeholder="type link here..."
              className={cx(
                "bg-transparent",
                "block w-full px-3 py-1.5",
                "rounded border border-solid border-transparent",
                "text-base font-normal text-gray-600",
                "transition ease-in-out",
                "placeholder:italic placeholder:text-slate-500",
                "focus:border-blue-200 focus:bg-blue-200/20 focus:text-gray-700 focus:outline-none"
              )}
            />
          </label>
          <button
            type="submit"
            name="_action"
            value="create"
            className={cx(
              "invisible group-focus-within:visible",
              "bg-blue-500 py-2 px-4 text-white ",
              "rounded hover:bg-blue-600 focus:bg-blue-400",
              "transition ease-in",
              "order-last"
            )}
          >
            Save
          </button>
          <button
            className={cx(
              "invisible group-focus-within:visible",
              "py-2 px-2 font-semibold text-slate-500 hover:text-slate-900",
              "rounded hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400",
              "transition ease-in"
            )}
            onClick={() => {
              if (inputRef.current) {
                inputRef.current.value = "";
                inputRef.current.focus();
              }
            }}
          >
            Cancel
          </button>
        </Form>
      </div>
    </div>
  );
}
