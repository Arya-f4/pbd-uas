import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ServerTokenProvider from "../ServerTokenProvider";
import SatuanPage from "@/components/Satuan/Satuan";
import { ToastProvider } from "@/components/ui/UseToast";
export default function Satuan() {
  return (
    <ServerTokenProvider>
      <DefaultLayout>
        <ToastProvider>
          <SatuanPage />
        </ToastProvider>
      </DefaultLayout>
    </ServerTokenProvider>
  );
}
