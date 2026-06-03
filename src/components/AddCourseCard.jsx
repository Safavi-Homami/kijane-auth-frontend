export default function AddCourseCard({ onClick }) {
  return (
    <div
      onClick={onClick}
      className="w-[250px] h-[320px] flex flex-col items-center justify-center
      rounded-xl border-2 border-dashed border-gray-300
      bg-white
      cursor-pointer
      transition-all duration-300
      hover:border-yellow-400
      hover:shadow-[0_25px_50px_rgba(250,204,21,0.25)]
      hover:-translate-y-1"
    >

      <div className="w-14 h-14 rounded-full bg-yellow-400 flex items-center justify-center text-white text-2xl shadow-md mb-4">
        +
      </div>

      <div className="font-semibold text-gray-800">
        Neuer Kurs
      </div>

      <div className="text-sm text-gray-400">
        Kurs erstellen
      </div>

    </div>
  );
}