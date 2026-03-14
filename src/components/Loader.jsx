import { ClipLoader } from "react-spinners";

const Loader = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <ClipLoader color="#4f46e5" size={50} />
    </div>
  );
};

export default Loader;
