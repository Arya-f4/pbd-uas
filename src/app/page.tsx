import ECommerce from "@/components/Dashboard/E-commerce";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
// src/app/page.tsx
import ServerTokenProvider from "./ServerTokenProvider";

export const metadata: Metadata = {
  title:
    "Next.js E-commerce Dashboard | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Home for TailAdmin Dashboard Template",
};

export default function Home() {
  return (
    <ServerTokenProvider>
      <DefaultLayout>
        <ECommerce />
      </DefaultLayout>
    </ServerTokenProvider>
  );
}
