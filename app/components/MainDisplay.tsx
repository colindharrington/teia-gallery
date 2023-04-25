import React, { useEffect, useState } from "react";
import { useQuery, gql } from "@apollo/client";
import Image from "next/image";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import {
  Button,
  Dialog,
  Divider,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { motion } from "framer-motion";
import Link from "next/link";

const GET_DIGITAL_ART = gql`
  query MyQuery($limit: Int!, $offset: Int!) {
    token(
      where: {
        holders: {
          holder: { address: { _eq: "tz1YPUoCAGcKYa4T8pYiKFvSg1ivVVUahRuX" } }
        }
      }
      offset: $offset
      limit: $limit
    ) {
      artifact_uri
      average
      decimals
      description
      display_uri
      extra
      flag
      highest_offer
      is_boolean_amount
      last_listed
      last_metadata_update
      level
      lowest_ask
      metadata
      mime
      name
      ophash
      rights
      supply
      symbol
      thumbnail_uri
      timestamp
      tzip16_key
      creators(order_by: {}) {
        creator_address
      }
    }
  }
`;

function ipfsHashToUrl(hash) {
  if (!hash) return null;
  const cleanHash = hash.replace("ipfs://", "");
  return `https://ipfs.io/ipfs/${cleanHash}`;
}

type digitalArt = {
  artifact_uri: string;
  average: number;
  decimals: number;
  description: string;
  display_uri: string;
  extra: string;
  flag: string;
  highest_offer: number;
  is_boolean_amount: boolean;
  last_listed: number;
  last_metadata_update: number;
  level: number;
  lowest_ask: number;
  metadata: string;
  mime: string;
  name: string;
  ophash: string;
  rights: string;
  supply: number;
  symbol: string;
  thumbnail_uri: string;
  timestamp: number;
  tzip16_key: string;
  creators: {
    creator_address: string;
  }[];
};

function formatDate(dateString) {
  const date = new Date(dateString);
  const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date
    .getFullYear()
    .toString()
    .substring(2)} at ${formatHour(date.getHours())}:${formatMinute(
    date.getMinutes()
  )} ${formatAMPM(date.getHours())}`;
  return formattedDate;
}

function formatHour(hour) {
  if (hour === 0) {
    return "12";
  } else if (hour > 12) {
    return (hour - 12).toString();
  } else {
    return hour.toString();
  }
}

function formatMinute(minute) {
  if (minute < 10) {
    return `0${minute}`;
  } else {
    return minute.toString();
  }
}

function formatAMPM(hour) {
  if (hour < 12) {
    return "AM";
  } else {
    return "PM";
  }
}
export default function MainDisplay() {
  const [digitalArt, setDigitalArt] = useState<digitalArt[]>([]);
  const [page, setPage] = useState(1);
  const unwantedAddresses = [
    "tz1erY7SqRTAM6UmdwzfmQ48VqB6675uUrHH",
    "tz1LtRavzB4VYRuYwcMbohYnV6SU2iRnU5DF",
  ];

  const itemsPerPage = 90;
  const { loading, error, data } = useQuery(GET_DIGITAL_ART, {
    variables: { limit: itemsPerPage, offset: (page - 1) * itemsPerPage },
  });

  useEffect(() => {
    if (data) {
      setDigitalArt(data.token);
    }
  }, [data]);

  const totalPages = Math.ceil(digitalArt.length / itemsPerPage);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    // <div style={{ backgroundColor: "#555", padding: 20, borderRadius: 5 }}>
    <div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <Grid container spacing={1}>
          {digitalArt
            .slice()
            .sort((a, b) => b.last_listed - a.last_listed)
            .filter(
              (art) =>
                !unwantedAddresses.some(
                  (address) => address === art.creators[0].creator_address
                )
            )
            .map((art, i) => (
              <Grid item xs={12} md={4} lg={3} key={i}>
                <Stack
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {art.extra[0].mime_type.startsWith("video/") ? (
                    <div
                      style={{
                        backgroundImage: `url(${ipfsHashToUrl(
                          art.display_uri || art.thumbnail_uri
                        )})`,
                        backgroundSize: "contain",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center center",
                        width: "300px",
                        height: "300px",
                        maxWidth: "100%",
                        maxHeight: "100%",
                      }}
                    />
                  ) : art.extra[0].mime_type === "image/jpeg" ||
                    art.extra[0].mime_type === "image/png" ||
                    art.extra[0].mime_type === "image/gif" ? (
                    <div>
                      <ImageItem art={art} />
                    </div>
                  ) : art.extra[0].mime_type === "audio/mpeg" ? (
                    <audio src={ipfsHashToUrl(art.extra[0].uri)} controls />
                  ) : art.extra[0].mime_type === "application/x-directory" ? (
                    <IframeItem art={art} />
                  ) : art.display_uri ? (
                    <div
                      style={{
                        backgroundImage: `url(${ipfsHashToUrl(
                          art.display_uri
                        )})`,
                        backgroundSize: "contain",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center center",
                        width: "300px",
                        height: "300px",
                        maxWidth: "100%",
                        maxHeight: "100%",
                      }}
                    />
                  ) : (
                    <Typography>Unsupported file format</Typography>
                  )}
                  <Stack sx={{ mt: 1 }}>
                    <Typography variant="caption">{art.name}</Typography>
                    {/* <Box
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      width: 120,
                      wordBreak: "break-all",
                    }}
                  > */}
                    <Typography
                      variant="caption"
                      align="center"
                      style={{ fontFamily: "Helvetica" }}
                    >
                      {art.creators[0].creator_address}
                    </Typography>
                    {/* </Box> */}
                  </Stack>
                </Stack>
              </Grid>
            ))}
        </Grid>
        <Stack spacing={2}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              bgcolor: "#222",
              my: 2,
            }}
          >
            <Box style={{ display: "flex", justifyContent: "center" }}>
              <Pagination
                count={3}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          </Paper>
        </Stack>
      </motion.div>
    </div>
  );
}

function ImageItem({ art }) {
  const [itemOpen, setItemOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  return (
    <div>
      <div
        onClick={() => setItemOpen(true)}
        style={{
          backgroundImage: `url(${ipfsHashToUrl(art.extra[0].uri)})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          width: "300px",
          height: "300px",
          maxWidth: "100%",
          maxHeight: "100%",
        }}
      />
      <Dialog
        open={itemOpen}
        onClose={() => setItemOpen(false)}
        sx={{
          "& .MuiBackdrop-root": {
            backgroundColor: "rgba(0, 0, 0, 0.95)",
          },
        }}
      >
        <div
          style={{
            backgroundImage: `url(${ipfsHashToUrl(art.extra[0].uri)})`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center center",
            width: "600px",
            height: "600px",
            maxWidth: "100%",
            maxHeight: "100%",
            backgroundColor: "black",
          }}
        />
        <Stack
          sx={{
            bgcolor: "black",
            color: "white",
            p: 2,
            display: "flex",
          }}
        >
          <Typography variant="h4">Title: {art.name}</Typography>
          <Typography>Minted: {formatDate(art.timestamp)}</Typography>
          <Typography>Total Supply: {art.supply}</Typography>
          <Divider sx={{ bgcolor: "white", my: 1 }} />
          <Link
            href={`https://objkt.com/profile/${art.creators[0].creator_address}/created`}
            target="_blank"
            rel="noopener"
          >
            <Typography variant="caption">Link to creator on OBJKT</Typography>
          </Link>
          <Typography variant="caption">
            Description: {art.description}
          </Typography>
        </Stack>
      </Dialog>
    </div>
  );
}

function IframeItem({ art }) {
  const [itemOpen, setItemOpen] = useState(false);
  return (
    <div>
      <div
        onClick={() => setItemOpen(true)}
        style={{
          backgroundImage: `url(${ipfsHashToUrl(art.display_uri)})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          width: "300px",
          height: "300px",
          maxWidth: "100%",
          maxHeight: "100%",
        }}
      />
      <Dialog open={itemOpen} onClose={() => setItemOpen(false)}>
        <iframe
          src={ipfsHashToUrl(art.extra[0].uri)}
          width="600"
          height="600"
          style={{ border: 0 }}
        />
      </Dialog>
    </div>
  );
}
