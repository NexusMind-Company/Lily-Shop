import ProfileOwner from "./profileOwner";
import ProfileVisiting from "./profileVisiting";
import { useSelector } from "react-redux";

const Profiles = ({ userId }) => {
  const authUserId = useSelector((state) => state.auth.user?.id);

  // Logic: If the visiting user is the owner, show owner head
  const isOwner = userId === authUserId;

  return (
    <div>
      {isOwner ? <ProfileOwner /> : <ProfileVisiting /> }
    </div>
  );
};

export default Profiles;