#!/bin/sh
# Four 30:00 masters, 3840x2160.
# 12 fps throughout so a held 3D plate stays a held plate, and every
# segment shares one timebase for a sample-accurate concat.
# Timeline matches src/data/films.ts.
set -eu
ROOT=/workspace
OUT=$ROOT/masters
FPS=12
mkdir -p "$OUT"

encode_still() {
  # $1 4K (or any) image  $2 seconds  $3 outfile
  yuv="${3%.mp4}.yuv"
  fade_out=$(awk -v d="$2" 'BEGIN{printf "%.2f", d-1.0}')
  ffmpeg -y -hide_banner -loglevel error -i "$1" -frames:v 1 -f rawvideo -pix_fmt yuv420p "$yuv"
  ffmpeg -y -hide_banner -loglevel error \
    -f rawvideo -pix_fmt yuv420p -s 3840x2160 -r "$FPS" -i "$yuv" \
    -vf "loop=loop=-1:size=1:start=0,trim=duration=${2},setpts=PTS-STARTPTS,fade=t=in:st=0:d=1,fade=t=out:st=${fade_out}:d=1,fps=${FPS}" \
    -an -c:v libx264 -preset ultrafast -profile:v baseline -level:v 5.1 \
    -crf 28 -pix_fmt yuv420p -r "$FPS" \
    -g 120 -keyint_min 12 -sc_threshold 0 -video_track_timescale 12288 \
    "$3"
  rm -f "$yuv"
}

encode_card() {
  png="${4%.mp4}.png"
  python3 "$ROOT/scripts/titlecard.py" "$1" "$2" "$png"
  encode_still "$png" "$3" "$4"
}

encode_open() {
  ffmpeg -y -hide_banner -loglevel error -i "$1" \
    -vf "setpts=4.8*PTS,scale=3840:2160:force_original_aspect_ratio=increase,crop=3840:2160,setsar=1,fps=${FPS},tpad=stop_mode=clone:stop=-1" \
    -t 48 \
    -an -c:v libx264 -preset ultrafast -profile:v baseline -level:v 5.1 \
    -crf 22 -pix_fmt yuv420p -r "$FPS" \
    -g 48 -keyint_min 12 -sc_threshold 0 -video_track_timescale 12288 \
    "$2"
}

encode_audio() {
  ffmpeg -y -hide_banner -loglevel error \
    -f lavfi -t 1800 -i "sine=frequency=$1:sample_rate=48000" \
    -f lavfi -t 1800 -i "sine=frequency=$2:sample_rate=48000" \
    -f lavfi -t 1800 -i "anoisesrc=color=brown:amplitude=0.4:sample_rate=48000" \
    -filter_complex "[0:a]volume=0.08[a];[1:a]volume=0.03[b];[2:a]lowpass=f=150,volume=0.16[c];[a][b][c]amix=inputs=3:duration=first,afade=t=in:st=0:d=6,afade=t=out:st=1786:d=14,aformat=sample_rates=48000:channel_layouts=stereo" \
    -c:a aac -b:a 128k "$3"
}

one_film() {
  slug=$1
  title=$2
  sub=$3
  hz=$4
  fifth=$5
  dest=$6
  work=$OUT/work-$slug
  rm -rf "$work"
  mkdir -p "$work"
  echo ">> $slug title $(date +%H:%M:%S)"
  encode_card "$title" "$sub" 12 "$work/00-title.mp4"
  echo ">> $slug open $(date +%H:%M:%S)"
  encode_open "$ROOT/masters/src/$slug.mp4" "$work/01-open.mp4"
  echo ">> $slug stills $(date +%H:%M:%S)"
  n=2
  for spec in "01 346" "02 346" "03 346" "04 345" "05 345"; do
    set -- $spec
    ffmpeg -y -hide_banner -loglevel error -i "$ROOT/public/films/$slug/$1.jpg" \
      -vf "scale=3840:2160:force_original_aspect_ratio=increase,crop=3840:2160" \
      -q:v 2 "$work/plate-$1.jpg"
    encode_still "$work/plate-$1.jpg" "$2" "$work/0${n}.mp4"
    echo "   plate $1 $(date +%H:%M:%S)"
    n=$((n + 1))
  done
  echo ">> $slug fin $(date +%H:%M:%S)"
  encode_card "FIN" "$title" 12 "$work/07-fin.mp4"
  ls "$work"/*.mp4 | sort | sed "s/^/file '/;s/$/'/" > "$work/list.txt"
  echo ">> $slug concat $(date +%H:%M:%S)"
  ffmpeg -y -hide_banner -loglevel error -f concat -safe 0 -i "$work/list.txt" -c copy "$work/silent.mp4"
  echo ">> $slug audio $(date +%H:%M:%S)"
  encode_audio "$hz" "$fifth" "$work/audio.m4a"
  ffmpeg -y -hide_banner -loglevel error \
    -i "$work/silent.mp4" -i "$work/audio.m4a" \
    -map 0:v -map 1:a -c copy -movflags +faststart -shortest \
    "$dest"
  rm -rf "$work"
  ls -lh "$dest"
  ffmpeg -hide_banner -i "$dest" 2>&1 | grep Duration
  echo ">> done $slug $(date +%H:%M:%S)"
}

one_film ceniza "CENIZA" "el invierno de ceniza" 73.42 110 "$OUT/CENIZA-4k.mp4"
one_film marea "MAREA NEGRA" "el mar que se quedó" 55 82.41 "$OUT/MAREA-NEGRA-4k.mp4"
one_film tierra "TIERRA MUERTA" "la cosecha que no llegó" 82.41 123.47 "$OUT/TIERRA-MUERTA-4k.mp4"
one_film senal "SIN SEÑAL" "la última frecuencia" 43.65 65.41 "$OUT/SIN-SENAL-4k.mp4"
echo ALL_DONE
