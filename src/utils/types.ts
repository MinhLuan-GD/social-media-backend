export type CreateNotificationDetails = {
  from: string;
  icon: string;
  text: string;
};

export type CreateUserDetails = {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  gender: string;
  bYear: string;
  bMonth: string;
  bDay: string;
};

export type FindUserParams = Partial<{
  _id: string;
  username: string;
  email: string;
}>;

export type ModifyUserFilter = Partial<{
  _id: string;
  email: string;
}>;

export type ModifyUserData = Partial<{
  verified: boolean;
  password: string;
  picture: string;
  cover: string;
  details: ModifyUserDetailsData;
}>;

export type ModifyUserDetailsData = Partial<{
  bio: string;
  otherName: string;
  job: string;
  workplace: string;
  highSchool: string;
  college: string;
  currentCity: string;
  hometown: string;
  relationship: string;
  instagram: string;
}>;

export type CreatePostDetails = {
  type: string;
  text: string;
  images: Array<{ url: string }>;
  postRef: string;
  user: string;
  background: string;
};

export type CreateCommentDetails = {
  postId: string;
  parentId: string;
  comment: string;
  image: string;
  socketId: string;
};

export type UpdateCommentDetails = {
  id: string;
  postId: string;
  parentId: string;
  comment: string;
  image: string;
};

export type UpdateOptions = Partial<{
  new: boolean;
  upsert: boolean;
  arrayFilters: { [key: string]: any }[];
}>;
