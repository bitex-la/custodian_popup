echo "Waiting dev server to load"
while [[ true ]]; do
  curl "localhost:9966"
  if [[ $? -eq 0 ]]; then
    break
  else
    sleep 0.2
  fi
done
