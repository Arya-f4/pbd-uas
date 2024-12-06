import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ServerTokenProvider from "../ServerTokenProvider";
import ReturPage from "@/components/Retur/Retur";
import { ToastProvider } from "@/components/ui/UseToast";
export default function Satuan() {
  return (
    <ServerTokenProvider>
      <DefaultLayout>
        <ToastProvider>
          <ReturPage />
        </ToastProvider>
      </DefaultLayout>
    </ServerTokenProvider>
  );
}
