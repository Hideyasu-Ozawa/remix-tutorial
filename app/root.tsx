import {
  Form,
  json,
  // Link,
  Links,
  Meta,
  NavLink,
  Outlet,
  redirect,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import appStylesHref from "./app.css?url";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { createEmptyContact, getContacts } from "./data";
import { useEffect } from "react";

export const action = async () => {
  const contact = await createEmptyContact();
  // return json({ contact });
  return redirect(`/contacts/${contact.id}/edit`);
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const contacts = await getContacts(q);
  return json({ contacts, q });
};

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStylesHref },
];
export default function App() {
  const { contacts, q } = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  const submit = useSubmit();
  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has("q");

  // the query now needs to be kept in state
  // const [query, setQuery] = useState(q || "");

  // we still have a `useEffect` to synchronize the query
  // to the component state on back/forward button clicks
  // useEffect(() => {
  //   setQuery(q || "");
  // }, [q]);
  useEffect(() => {
    const searchField = document.getElementById("q");
    if (searchField instanceof HTMLInputElement) {
      searchField.value = q || "";
    }
  }, [q]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="sidebar">
          <h1>Remix Contacts</h1>
          <div>
            <Form id="search-form" role="search">
              <input
                id="q"
                aria-label="Search contacts"
                className={searching ? "loading" : ""}
                defaultValue={q || ""}
                placeholder="Search"
                type="search"
                name="q"
                onChange={(event) => {
                  const isFirstSearch = q === null;
                  submit(event.currentTarget, {
                    replace: !isFirstSearch,
                  });
                }}
                // synchronize user's input to component state
                // onChange={(event) => setQuery(event.currentTarget.value)}
                // value={query}
              />
              <div id="search-spinner" aria-hidden hidden={!searching} />
            </Form>
            <Form method="post">
              <button type="submit">New</button>
            </Form>
          </div>
          <nav>
            {/* <ul>
              <li>
                <a href={"/contacts/1"}>Your Name(a tag)</a>
              </li>
              <li>
                <a href={"/contacts/2"}>Your Friend(a tag)</a>
              </li>
              <li>
                <Link to={"/contacts/1"}>Your Name(Link component)</Link>
              </li>
              <li>
                <Link to={"/contacts/2"}>Your Friend(Link component)</Link>
              </li>
            </ul> */}
            {contacts.length ? (
              <ul>
                {contacts.map((contact) => (
                  <li key={contact.id}>
                    <NavLink
                      className={({ isActive, isPending }) =>
                        isActive ? "active" : isPending ? "pending" : ""
                      }
                      to={`contacts/${contact.id}`}
                    >
                      {/* <Link to={`contacts/${contact.id}`}> */}
                      {contact.first || contact.last ? (
                        <>
                          {contact.first} {contact.last}
                        </>
                      ) : (
                        <i>No Name</i>
                      )}{" "}
                      {contact.favorite ? <span>★</span> : null}
                      {/* </Link> */}
                    </NavLink>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                <i>No contacts</i>
              </p>
            )}
          </nav>
        </div>
        <div
          className={
            navigation.state === "loading" && !searching ? "loading" : ""
          }
          id="detail"
        >
          <Outlet />
        </div>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
