import pooling from "../main";

interface IRequestMock {
  status: "PENDING" | "DONE"
}

function requestMock(shouldDone: boolean): Promise<IRequestMock> {
  return new Promise(
    (resolve) => setTimeout(() => resolve({ status: shouldDone ? "DONE" : "PENDING" }), 10)
  );
}

describe("Testing pooling", () => {
  test("Should call until max attempts", (done) => {
    let attempts = 0;
    const testPooling = pooling<IRequestMock>({
      async fn() {
        attempts++;
        const data = await requestMock(attempts > 6);
        return data;
      },
      validate: ({ status }: IRequestMock) => status === "DONE",
      interval: 10,
      maxAttempts: 5
    });

    testPooling.catch(() => {
      expect(attempts).toBeLessThan(6);
      done();
    });
  });

  test("Should stop polling when validate is true", (done) => {
    let attempts = 0;
    const testPooling = pooling<IRequestMock>({
      async fn() {
        attempts++;
        const data = await requestMock(attempts > 1);
        return data;
      },
      validate: ({ status }: IRequestMock) => status === "DONE",
      interval: 10,
      maxAttempts: 12
    });

    testPooling.then(() => {
      expect(attempts).toBeLessThan(3);
      done();
    });
  });
  test("Should use intervalDelay when provided", (done) => {
    let attempts = 0;
    const mockedIntervalDelay = jest.fn().mockReturnValue(10)
    const testPooling = pooling<IRequestMock>({
      async fn() {
        attempts++;
        const data = await requestMock(attempts > 6);
        return data;
      },
      validate: ({ status }: IRequestMock) => status === "DONE",
      intervalDelay: mockedIntervalDelay,
      maxAttempts: 5
    });

    testPooling.catch(() => {
      expect(attempts).toBe(5);
      expect(mockedIntervalDelay).toHaveBeenCalledTimes(5)
      expect(mockedIntervalDelay).toHaveBeenCalledWith(1)
      expect(mockedIntervalDelay).toHaveBeenCalledWith(2)
      expect(mockedIntervalDelay).toHaveBeenCalledWith(3)
      expect(mockedIntervalDelay).toHaveBeenCalledWith(4)
      expect(mockedIntervalDelay).toHaveBeenCalledWith(5)
      done();
    });
  });
});
