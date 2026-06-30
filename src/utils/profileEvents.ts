export const PROFILE_UPDATED_EVENT = "profile:updated";

export type ProfileUpdateDetail = {
  username?: string;
  name?: string;
  profileImage?: string;
  coverImage?: string;
  bio?: string;
};

export const notifyProfileUpdated = (detail: ProfileUpdateDetail) => {
  window.dispatchEvent(
    new CustomEvent<ProfileUpdateDetail>(PROFILE_UPDATED_EVENT, { detail })
  );
};
