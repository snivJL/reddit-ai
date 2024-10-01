import Image from "next/image";

type Props = {
  url: string;
  alt: string;
};
const ImageBlur = ({ url, alt = "image" }: Props) => {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 rounded-lg bg-gradient-to-l from-accent via-transparent to-accent/60 blur-xl"></div>
      <div className="relative mx-auto max-w-2xl">
        <Image
          className="mx-auto"
          src={url}
          alt={alt}
          width={0}
          height={0}
          sizes="100vw"
          style={{ width: "auto", height: "400px" }}
        />
      </div>
    </div>
  );
};

export default ImageBlur;
