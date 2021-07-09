const LOCALHOST = /localhost:\d+/;

export const Origins = {
  LOCALHOST,
  LOCALHOST_IN_DEVELOPMENT:
    process.env.NODE_ENV === 'production' ? false : LOCALHOST,
};
