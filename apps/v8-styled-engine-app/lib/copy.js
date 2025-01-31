// @ts-expect-error
import { styled, css } from '@my-lib/styled';
export var Hello = styled("div")({
  __css: "@custom-media --md (width>=40rem);:scope{color:var(--color-text-primary);background:red}.primary{background:#00f}",
  classes: {}
});
export var Hello2 = styled("div")({
  __css: "@custom-media --md (width>=40rem);:scope{color:var(--color-text-primary);background:red}.primary{background:#00f}",
  classes: {}
});
export var WrappedHello = styled(Hello)({
  __css: "@custom-media --md (width>=40rem);.current{color:red}",
  classes: {}
});

// implicit :scope, we can make it optional for simpler styles
export var someSx = {
  __css: "@custom-media --md (width>=40rem);.current{color:#00f}@media (width<=600px){.current{color:gray}}",
  classes: {}
};
export var temp = {
  __css: "@custom-media --md (width>=40rem);.current{color:red}",
  classes: {}
};
export var Div = styled("div")({
  __css: "@custom-media --md (width>=40rem);.current{color:var(--red)}.current .nested{color:var(--green)}",
  classes: {}
});