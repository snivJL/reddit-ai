import { cn } from "@/lib/utils";
import { AvatarFallback, Avatar } from "./ui/avatar";

type Props = {
  className?: string;
};
const UserAvatar = ({ className }: Props) => {
  return (
    <Avatar className={cn("size-8", className)}>
      <AvatarFallback>r/</AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
