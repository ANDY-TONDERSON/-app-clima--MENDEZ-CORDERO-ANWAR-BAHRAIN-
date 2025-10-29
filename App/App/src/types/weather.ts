export type Hour = {
  time: string;
  tempC: number;
  icon: string;
  desc: string;
};

export type WeatherData = {
  location: string;
  updatedAt: string;
  current: {
    tempC: number;
    desc: string;
    humidity: number;
    windKmh: number;
    pressure: number;
    visibility: number;
  };
  today: {
    date: string;
    hours: Hour[];
  };
};
