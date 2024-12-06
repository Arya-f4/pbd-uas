import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ServerTokenProvider from "../ServerTokenProvider";
import BarangPage from "@/components/Barang/Barang";
import { ToastProvider } from "@/components/ui/UseToast";
export default function Barang() {
  return (
    <ServerTokenProvider>
      <DefaultLayout>
        <ToastProvider>
          <BarangPage />
        </ToastProvider>
      </DefaultLayout>
    </ServerTokenProvider>
  );
}
