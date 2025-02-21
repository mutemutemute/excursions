const ExcursionCard = ({ excursion }) => {
  const {
    id,
    name,
    image_url,
    duration,
    price,
    user_rating,
    category_id,
    description,
  } = excursion;
  return (
    <div >
        <div>
        <p>{name}</p>
        <p><img src={image_url} alt="image"/></p>
        </div>
    </div>
  )
};

export default ExcursionCard;
