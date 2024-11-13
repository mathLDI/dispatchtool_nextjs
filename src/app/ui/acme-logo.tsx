import { GlobeAltIcon } from '@heroicons/react/outline';
import { lusitana } from '@/app/ui/fonts';


export default function AcmeLogo() {
  return (
    <div
      className={`${lusitana.className} flex flex-row items-center leading-none text-white p-2`}
    >
    
      <p className="text-[44px]">DXP Tools</p>
    </div>
  );
}
