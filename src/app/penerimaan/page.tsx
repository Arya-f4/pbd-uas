import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ServerTokenProvider from "../ServerTokenProvider";
import PenerimaanPage from "@/components/Penerimaan/Penerimaan";
import { ToastProvider } from "@/components/ui/UseToast";
export default function Penerimaan() {
  return (
    <ServerTokenProvider>
      <DefaultLayout>
        <ToastProvider>
          <PenerimaanPage />
        </ToastProvider>
      </DefaultLayout>
    </ServerTokenProvider>
  );
}
