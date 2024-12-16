import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ServerTokenProvider from "@/app/ServerTokenProvider";
import { ToastProvider } from "@/components/ui/UseToast";
import MarginPage from "@/components/Penjualan/Margin";
export default function Penjualan() {
  return (
    <ServerTokenProvider>
      <DefaultLayout>
        <ToastProvider>
          <MarginPage />
        </ToastProvider>
      </DefaultLayout>
    </ServerTokenProvider>
  );
}
