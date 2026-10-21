#!/bin/bash
cd /home/jayca/projects/flightcrewfiles
set -a && source .env && set +a
python3 setup_flightcrewfiles.py
