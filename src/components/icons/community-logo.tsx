/**
 * CommunityLogo component that displays the "Made by the community" icon
 * positioned fixed at the bottom right of the screen.
 */
export const CommunityLogo = () => {
  return (
    <img
      src={"/MadeByTheCommunity_Black.png"}
      alt="Made by the community"
      width={64}
      height={64}
      className="community-logo"
    />
  );
};