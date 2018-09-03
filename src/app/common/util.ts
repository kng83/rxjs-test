import {Observable} from 'rxjs';

// dodajemy teraz logike do cancelowania naszej observable
export function createHttpObservable(url: string) {
  // tworzymy observable i wsadzamy do niej funkcje fetch
  // dzieki temu robimy strumien observable
  // dodajemy AbortController ktory umozliwia na kasowanie zadania fetch
  // blad tutaj byl poniewaz controller i signal wrzucilem przed returna i to
  // powazny blad bo powielanie observable uzywajac retryWhen nie dzialalo

  return Observable.create(observer => {
    const controller = new AbortController();
    const signal = controller.signal;

    fetch(url, {signal: signal})
      .then(response => {

        if (response.ok) {
          return response.json();
        } else {
          observer.error('Request failed with status code:' + response.status);
        }
      })
      .then(body => {
        observer.next(body);
        observer.complete(); // aby nie emitowac wiecej
      })
      .catch(err => {
        observer.error(err);
      });
    // controller.abort(); jak bysmy chcieli cancelowac w definicj funkcji

    return () => controller.abort();
  });
}

