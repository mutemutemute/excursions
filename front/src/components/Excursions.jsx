import { useContext } from "react";
import ExcursionContext from "../contexts/ExcursionContext";
import ExcursionCard from "./ExcursionCard";
const Excursions = () => {
    const { excursions } = useContext(ExcursionContext);
    return (
        <div className="grid md:grid-cols-2 mx-10 gap-10">
      
        {excursions.list && excursions.list.length > 0 ? (
          excursions.list.map((excursion, index) => (
            <ExcursionCard
              key={
                excursion.id
                  ? `appointment-${excursion.id}`
                  : `index-${index}`
              }
              excursion={excursion}
            />
          ))
        ) : (
          <p>No excursions found</p>
        )}
      </div>
    
    )
};

export default Excursions;