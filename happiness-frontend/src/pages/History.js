import Histories from "../components/Histories";
import Users from "../components/Users";
import { Tab } from "@headlessui/react";
import { useState, Fragment, useEffect } from "react";
import MonthView from "../components/MonthView";
import { GetRangeHappiness } from "../components/GetHappinessData";
import { useUser } from "../contexts/UserProvider";
import { Spinner } from "react-bootstrap";
import { useQuery } from "react-query";
import { useApi } from "../contexts/ApiProvider";

export default function History(props) {
  const { user: userState } = useUser();
  const me = userState.user;

  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());

  console.log(start);
  console.log(end);
  useEffect(
    () =>
      setStart((start) => {
        start.setDate(start.getDate() - start.getDay());
        return new Date(start);
      }),
    []
  );
  useEffect(
    () =>
      setEnd((end) => {
        end.setDate(end.getDate() + 7 - end.getDay());
        return new Date(end);
      }),
    []
  );
  console.log(start);
  console.log(end);

  const [isLoading, data, error, refetch] = GetRangeHappiness(
    me,
    start.toISOString().substring(0, 10),
    end.toISOString().substring(0, 10)
  );
  useEffect(() => {
    refetch();
  }, [start, end]);

  const [stMonth, setStMonth] = useState(new Date());
  const [endMonth, setEndMonth] = useState(new Date());
  useEffect(
    () =>
      setStMonth((start) => {
        start.setDate(1);
        return new Date(start);
      }),
    []
  );
  useEffect(
    () =>
      setEndMonth((end) => {
        end.setDate(
          new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate()
        );
        return new Date(end);
      }),
    []
  );
  console.log(stMonth);
  console.log(endMonth);

  const [isLoadingM, dataM, errorM, refetchM] = GetRangeHappiness(
    me,
    stMonth.toISOString().substring(0, 10),
    endMonth.toISOString().substring(0, 10)
  );
  useEffect(() => {
    refetchM();
  }, [stMonth, endMonth]);
  console.log(dataM);

  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <>
      <div>
        <p className="text-center text-5xl font-medium m-3 lg:my-4 text-raisin-600">
          History
        </p>
      </div>
      <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
        <Tab.List className="lg:absolute lg:top-20 lg:right-10 flex sm-lg:w-full justify-center">
          <Tab as={Fragment}>
            {({ selected }) => (
              <button
                className={
                  selected
                    ? "inline-block sm:px-4 py-2 sm:py-4 mb-1 md:m-1.5 w-[110px] md:h-[60px] rounded-l-lg md:rounded-lg text-cultured-50 bg-raisin-600 text-xs sm:text-sm md:text-md text-center"
                    : "inline-block sm:px-4 py-2 sm:py-4 mb-1 md:m-1.5 w-[110px] md:h-[60px] rounded-l-lg md:rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-white text-xs sm:text-sm md:text-md text-center"
                }
                onClick={refetch}
              >
                Weekly
              </button>
            )}
          </Tab>
          <Tab as={Fragment}>
            {({ selected }) => (
              <button
                className={
                  selected
                    ? "inline-block sm:px-4 py-2 sm:py-3 mb-1 md:m-1.5 w-[110px] md:h-[60px] rounded-r-lg md:rounded-lg text-cultured-50 bg-raisin-600 text-xs sm:text-sm md:text-md text-center"
                    : "inline-block sm:px-4 py-2 sm:py-3 mb-1 md:m-1.5 w-[110px] md:h-[60px] rounded-r-lg md:rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-white text-xs sm:text-sm md:text-md text-center"
                }
                onClick={refetchM}
              >
                Monthly
              </button>
            )}
          </Tab>
        </Tab.List>
        <Tab.Panels className="flex w-full justify-center">
          <Tab.Panel className="w-full justify-center">
            <div className="relative flex flex-wrap items-center justify-center w-full text-center pt-2">
              <button
                className="absolute px-3 py-2 my-2 left-2 w-[50px] rounded-lg text-cultured-50 bg-raisin-600 text-2xl"
                onClick={() => {
                  setEnd((end) => {
                    end.setDate(end.getDate() - 7);
                    return new Date(end);
                  });
                  setStart((start) => {
                    start.setDate(start.getDate() - 7);
                    return new Date(start);
                  });
                }}
              >
                &lt;
              </button>
              <h3 className="w-full">
                Week of {start.toISOString().slice(0, 10)}
              </h3>
              <button
                className="absolute px-3 py-2 my-2 right-2 w-[50px] rounded-lg text-cultured-50 bg-raisin-600 text-2xl"
                onClick={(_) => {
                  setEnd((end) => {
                    end.setDate(end.getDate() + 7);
                    return new Date(end);
                  });
                  setStart((start) => {
                    start.setDate(start.getDate() + 7);
                    return new Date(start);
                  });
                }}
              >
                &gt;
              </button>
            </div>
            {isLoading ? (
              <Spinner animation="border" />
            ) : (
              <>
                {error ? (
                  <p className="text-xl font-medium text-raisin-600 m-3 text-center">
                    Error: Could not load happiness.
                  </p>
                ) : (
                  <>
                    {data.length === 0 ? (
                      <p className="text-xl font-medium text-raisin-600 m-3 text-center">
                        Data not available for selected period.
                      </p>
                    ) : (
                      <>
                        <Histories dataList={data} />
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </Tab.Panel>
          <Tab.Panel className="w-full justify-center">
            <div className="flex flex-wrap w-full justify-center mt-3">
              <div className="flex flex-wrap justify-center border-solid w-full max-w-[550px] lg:w-2/3">
                <div className="font-medium relative w-full text-center text-2xl py-2 my-0 bg-buff-200 h-[60px]">
                  <button
                    className="absolute top-3 left-4 w-[40px] md:w-[60px] h-[40px] rounded-lg text-cultured-50 bg-raisin-600 text-xl"
                    onClick={() => {
                      setStMonth((start) => {
                        start.setMonth(start.getMonth() - 1);
                        return new Date(start);
                      });
                      setEndMonth((end) => {
                        end.setDate(1);
                        end.setMonth(end.getMonth() - 1);
                        end.setDate(
                          new Date(
                            end.getFullYear(),
                            end.getMonth() + 1,
                            0
                          ).getDate()
                        );
                        return new Date(end);
                      });
                    }}
                  >
                    &lt;
                  </button>
                  <p className="py-2">
                    {stMonth.toLocaleString("en-US", { month: "long" }) +
                      " " +
                      stMonth.getFullYear()}{" "}
                  </p>
                  <button
                    className="absolute top-3 right-4 w-[40px] md:w-[60px] h-[40px] rounded-lg text-cultured-50 bg-raisin-600 text-xl"
                    onClick={() => {
                      setStMonth((start) => {
                        start.setMonth(start.getMonth() + 1);
                        return new Date(start);
                      });
                      setEndMonth((end) => {
                        end.setDate(1);
                        end.setMonth(end.getMonth() + 1);
                        end.setDate(
                          new Date(
                            end.getFullYear(),
                            end.getMonth() + 1,
                            0
                          ).getDate()
                        );
                        return new Date(end);
                      });
                    }}
                  >
                    &gt;
                  </button>
                </div>
                {isLoadingM ? (
                  <Spinner animation="border" />
                ) : (
                  <>
                    {errorM ? (
                      <p className="text-xl font-medium text-raisin-600 m-3 text-center">
                        Error: Could not load happiness.
                      </p>
                    ) : (
                      <>
                        {dataM.length === 0 ? (
                          <p className="text-xl font-medium text-raisin-600 m-3 text-center">
                            Data not available for selected period.
                          </p>
                        ) : (
                          <MonthView
                            happinessData={dataM}
                            startday={stMonth}
                            endday={endMonth}
                          />
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
              Placeholder
              {/* <div className="w-full flex flex-wrap justify-center max-w-[550px] lg:w-1/3 lg:mx-6 -mt-4">
                <BigHistoryCard
                  id={1}
                  data={}
                  shown={true}
                  useDate={true}
                />
                <div className="w-full justify-center my-4 hidden lg:flex">
                  <Stat id={1} val={0} />
                  <Stat id={1} val={1} />
                </div>
              </div> */}
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </>
  );
}
