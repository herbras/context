export type ScheduleTrain = {
  status: number;
  data: {
    train_id: string;
    ka_name: string;
    station_id: string;
    station_name: string;
    time_est: string;
    transit_station: boolean;
    color: string;
    transit: string[];
  }[];
};

export type KrlStation = {
  status: number;
  message: string;
  data: {
    sta_id: string;
    sta_name: string;
    group_wil: number;
    fg_enable: number;
  }[];
};

export type Schedule = {
  status: number;
  data: {
    train_id: string;
    ka_name: string;
    route_name: string;
    dest: string;
    time_est: string;
    color: string;
    dest_time: string;
  }[];
};
