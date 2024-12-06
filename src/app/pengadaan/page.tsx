import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ServerTokenProvider from "../ServerTokenProvider";
import PengadaanPage from "@/components/Pengadaan/Pengadaan";
import { ToastProvider } from "@/components/ui/UseToast";
export default function Pengadaan() {
  return (
    <ServerTokenProvider>
      <DefaultLayout>
        <ToastProvider>
          <PengadaanPage />
        </ToastProvider>
      </DefaultLayout>
    </ServerTokenProvider>
  );
}
