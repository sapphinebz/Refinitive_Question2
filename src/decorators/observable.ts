import { isObservable, Observable, Subscription } from 'rxjs';
import { first } from 'rxjs/operators';

export namespace Rx {
  const compScptSymbol = Symbol('component subscription');

  export function AutoSubscribe(option: {
    propertyName: string;
    once?: boolean;
  }) {
    return (target: any, propertyName: string) => {
      const symbol = Symbol('observable');
      const scptSymbol = Symbol('subscription');
      Object.defineProperty(target, propertyName, {
        get: function () {
          return this[symbol];
        },
        set: function (value: Observable<any>) {
          this[symbol] = value;
          if (isObservable(value)) {
            let subscription: Subscription = this[scptSymbol];
            if (subscription) {
              subscription.unsubscribe();
            }
            subscription = value
              .pipe((source) => {
                if (option.once) {
                  return source.pipe(first());
                }
                return source;
              })
              .subscribe((changed) => (this[option.propertyName] = changed));
            this[scptSymbol] = subscription;
            addComponentSubscription(this, subscription);
          }
        },
      });
    };
  }

  function addComponentSubscription(target: any, subscription: Subscription) {
    target[compScptSymbol] ??= new Subscription();
    (target[compScptSymbol] as Subscription).add(subscription);
  }

  function removeSubscriptionComponent(
    target: any,
    subscription: Subscription
  ) {
    const componentSubscription = target[compScptSymbol];
    if (
      componentSubscription &&
      componentSubscription instanceof Subscription
    ) {
      componentSubscription.remove(subscription);
    }
  }
}
