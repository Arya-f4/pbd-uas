import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import ClientTokenProvider from "./ClientTokenProvider";

export default function ServerTokenProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const token = cookieStore.get("token");
  let user = null;

  if (token) {
    try {
      user = jwt.verify(
        token.value,
        process.env.JWT_SECRET as string,
      ) as object;
    } catch (error) {
      console.error("Invalid token:", error);
    }
  }

  return <ClientTokenProvider user={user}>{children}</ClientTokenProvider>;
}
