export type NavigationDirection = 1 | -1;



let pendingDirection: NavigationDirection = 1;



export function setPendingNavigationDirection(direction: NavigationDirection) {

  pendingDirection = direction;

}



export function peekPendingNavigationDirection(): NavigationDirection {

  return pendingDirection;

}



export function consumePendingNavigationDirection(): NavigationDirection {

  const direction = pendingDirection;

  pendingDirection = 1;

  return direction;

}