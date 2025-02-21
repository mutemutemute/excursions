import Navbar from "./Navbar";
import Excursions from "./Excursions";
import Pagination from "./Pagination";
const Home = () => {
  return (
    <>
      <Navbar />
      <div className="pt-5">
        <Excursions />
      </div>
      <div className="pt-10"><Pagination /></div>
    </>
  );
};

export default Home;
