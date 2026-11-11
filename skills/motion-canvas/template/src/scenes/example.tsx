import {makeScene2D, Circle, Txt} from '@motion-canvas/2d';
import {all, createRef} from '@motion-canvas/core';
export default makeScene2D(function* (view) {
  view.fill('#111');
  const c = createRef<Circle>();
  const t = createRef<Txt>();
  view.add(<Circle ref={c} size={200} fill="#e13238" />);
  view.add(<Txt ref={t} y={300} fill="#fff" fontSize={80} opacity={0} text="Motion Canvas" />);
  yield* all(c().size(600, 1), c().fill('#e6a700', 1), t().opacity(1, 1));
  yield* c().size(200, 1);
});
