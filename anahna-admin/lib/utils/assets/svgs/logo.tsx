import Image from 'next/image';

export function AppLogo() {
  return (
    <div className="flex items-center justify-center relative p-2">
      <div className="w-40 h-12 shadow-lg overflow-hidden flex items-center justify-center bg-white">
        <Image
          src="/assets/images/png/logo%20(3).png"
          alt="Logo"
          width={160}
          height={48}
          className="object-contain w-full h-full"
        />
      </div>
    </div>
  );
}
