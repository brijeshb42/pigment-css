fn uint32(s: &str, pos: usize) -> u32 {
  (s.chars().nth(pos).unwrap_or('\0') as u32)
    | ((s.chars().nth(pos + 1).unwrap_or('\0') as u32) << 8)
    | ((s.chars().nth(pos + 2).unwrap_or('\0') as u32) << 16)
    | ((s.chars().nth(pos + 3).unwrap_or('\0') as u32) << 24)
}

fn uint16(s: &str, pos: usize) -> u32 {
  (s.chars().nth(pos).unwrap_or('\0') as u32)
    | ((s.chars().nth(pos + 1).unwrap_or('\0') as u32) << 8)
}

fn umul32(n: u32, m: u32) -> u32 {
  let nlo = n & 0xffff;
  let nhi = n >> 16;
  nlo * m + (((nhi * m) & 0xffff) << 16)
}

fn do_hash(s: &str, seed: u32) -> u32 {
  let m = 0x5bd1e995;
  let r = 24;
  let mut h = seed ^ s.len() as u32;
  let mut length = s.len();
  let mut current_index = 0;

  while length >= 4 {
    let mut k = uint32(s, current_index);
    k = umul32(k, m);
    k ^= k >> r;
    k = umul32(k, m);

    h = umul32(h, m);
    h ^= k;

    current_index += 4;
    length -= 4;
  }

  match length {
    3 => {
      h ^= uint16(s, current_index);
      h ^= (s.chars().nth(current_index + 2).unwrap_or('\0') as u32) << 16;
      h = umul32(h, m);
    }
    2 => {
      h ^= uint16(s, current_index);
      h = umul32(h, m);
    }
    1 => {
      h ^= s.chars().nth(current_index).unwrap_or('\0') as u32;
      h = umul32(h, m);
    }
    _ => {}
  }

  h ^= h >> 13;
  h = umul32(h, m);
  h ^= h >> 15;

  h
}

pub fn slugify(code: &str) -> String {
  format!("p{:x}", do_hash(code, 0))
}
