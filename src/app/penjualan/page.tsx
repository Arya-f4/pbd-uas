import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ServerTokenProvider from "../ServerTokenProvider";
import { ToastProvider } from "@/components/ui/UseToast";
import PenjualanPage from "@/components/Penjualan/Penjualan";
export default function Penjualan() {
  return (
    <ServerTokenProvider>
      <DefaultLayout>
        <ToastProvider>
          <PenjualanPage />
        </ToastProvider>
      </DefaultLayout>
    </ServerTokenProvider>
  );
}
