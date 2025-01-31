import createEmotion from '@emotion/css/create-instance';

const emotion = createEmotion({
  key: 'v8',
});

export const css = emotion.css;
export const cache = emotion.cache;
export const keyframes = emotion.keyframes;
