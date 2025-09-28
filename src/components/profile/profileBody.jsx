import ProfileBodyOwner from "./profileBodyOwner";
import ProfileBodyVisiting from "./profileBodyVisiting";
import { useSelector } from "react-redux";

const ProfileHead = ({ userId }) => {
  const authUserId = useSelector((state) => state.auth.user?.id);

  // Logic: If the visiting user is the owner, show owner post body
  const isOwner = userId === authUserId;

  return (
    <div>
      {isOwner ? <ProfileBodyOwner /> : <ProfileBodyVisiting />}
    </div>
  );
};

export default ProfileHead;