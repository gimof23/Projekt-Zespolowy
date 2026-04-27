-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sty 14, 2026 at 01:46 PM
-- Wersja serwera: 10.4.32-MariaDB
-- Wersja PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cinema_system`
--

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `screening_id` int(11) NOT NULL,
  `seat_number` varchar(20) NOT NULL,
  `status` enum('paid','booked','cancelled','returned') NOT NULL DEFAULT 'paid',
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `user_id`, `screening_id`, `seat_number`, `status`, `created_at`) VALUES
(1, 2, 35, 'R14-S3', 'paid', '2026-01-03 21:03:37'),
(2, 2, 35, 'R14-S2', 'returned', '2026-01-03 21:03:37'),
(3, 2, 35, 'R14-S2', 'paid', '2026-01-03 21:11:16'),
(4, 2, 35, 'R14-S4', 'paid', '2026-01-03 21:12:56'),
(5, 2, 35, 'R13-S7', 'paid', '2026-01-03 21:12:56'),
(6, 5, 35, 'R10-S5', 'paid', '2026-01-03 21:27:59'),
(7, 5, 35, 'R10-S6', 'paid', '2026-01-03 21:27:59'),
(8, 5, 35, 'R10-S7', 'paid', '2026-01-03 21:27:59'),
(9, 5, 35, 'R11-S7', 'paid', '2026-01-03 21:29:44'),
(10, 5, 35, 'R11-S6', 'paid', '2026-01-03 21:29:44'),
(11, 5, 35, 'R12-S7', 'paid', '2026-01-03 21:40:31'),
(12, 5, 35, 'R12-S6', 'paid', '2026-01-03 21:40:32'),
(13, 5, 43, 'R9-S5', 'returned', '2026-01-04 18:02:58'),
(14, 5, 43, 'R9-S6', 'returned', '2026-01-04 18:02:58'),
(15, 5, 43, 'R14-S3', 'returned', '2026-01-04 18:02:58'),
(16, 5, 43, 'R10-S5', 'paid', '2026-01-04 18:06:35'),
(17, 5, 43, 'R10-S6', 'paid', '2026-01-04 18:06:35'),
(18, 5, 43, 'R14-S3', 'paid', '2026-01-04 18:06:35'),
(19, 5, 46, 'R11-S4', 'paid', '2026-01-04 18:09:26'),
(20, 5, 46, 'R11-S5', 'paid', '2026-01-04 18:09:26'),
(21, 5, 46, 'R14-S3', 'paid', '2026-01-04 18:09:26'),
(22, 5, 35, 'R15-S2', 'paid', '2026-01-04 18:14:05'),
(23, 5, 35, 'R15-S3', 'paid', '2026-01-04 18:14:05'),
(24, 5, 32, 'R10-S6', 'paid', '2026-01-04 18:15:30'),
(25, 5, 43, 'R14-S4', 'paid', '2026-01-04 18:16:29'),
(26, 5, 36, 'R8-S6', 'paid', '2026-01-04 18:25:28'),
(27, 5, 36, 'R8-S7', 'paid', '2026-01-04 18:25:28'),
(28, 5, 36, 'R12-S4', 'paid', '2026-01-04 18:32:58'),
(29, 5, 36, 'R12-S3', 'paid', '2026-01-04 18:36:53'),
(30, 5, 37, 'R14-S3', 'paid', '2026-01-04 18:40:28'),
(31, 5, 48, 'R12-S5', 'paid', '2026-01-04 18:50:12'),
(32, 5, 48, 'R12-S6', 'paid', '2026-01-04 18:50:12'),
(33, 5, 48, 'R11-S6', 'paid', '2026-01-04 18:51:10'),
(34, 5, 46, 'R10-S7', 'cancelled', '2026-01-04 18:53:16'),
(45, 5, 49, 'R12-S4', 'paid', '2026-01-06 22:03:53'),
(46, 5, 49, 'R12-S5', 'paid', '2026-01-06 22:03:53'),
(47, 5, 49, 'R13-S3', 'cancelled', '2026-01-07 00:23:05'),
(48, 5, 49, 'R14-S5', 'cancelled', '2026-01-07 00:24:01'),
(49, 5, 51, 'R13-S4', 'paid', '2026-01-07 13:06:01'),
(50, 5, 51, 'R12-S4', 'paid', '2026-01-07 13:06:01'),
(51, 5, 51, 'R12-S2', 'paid', '2026-01-07 13:10:02'),
(52, 5, 51, 'R12-S3', 'paid', '2026-01-07 13:10:02'),
(53, 5, 49, 'R13-S4', 'paid', '2026-01-07 13:22:39'),
(54, 5, 49, 'R13-S3', 'paid', '2026-01-07 13:22:39'),
(58, 5, 49, 'R12-S2', 'paid', '2026-01-07 14:20:59'),
(59, 5, 49, 'R13-S2', 'paid', '2026-01-07 14:20:59'),
(60, 5, 52, 'R12-S4', 'paid', '2026-01-10 17:37:25'),
(61, 5, 52, 'R12-S3', 'paid', '2026-01-10 17:37:25'),
(62, 5, 81, 'R10-S6', 'paid', '2026-01-13 22:14:17'),
(63, 5, 81, 'R12-S4', 'paid', '2026-01-13 22:14:17'),
(64, 5, 81, 'R13-S5', 'paid', '2026-01-13 22:43:28'),
(65, 5, 81, 'R11-S9', 'paid', '2026-01-13 22:43:28'),
(66, 5, 81, 'R4-S8', 'paid', '2026-01-13 22:43:28');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `halls`
--

CREATE TABLE `halls` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `seats` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `layout_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`layout_data`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `halls`
--

INSERT INTO `halls` (`id`, `name`, `seats`, `created_at`, `layout_data`) VALUES
(5, 'sala 1 (normalna)', 134, '2025-12-12 19:57:40', '[[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,1,1,3,3,3,3,3,3,3,1,1,0,0],[0,0,1,1,1,1,1,1,1,1,1,1,1,0,0],[0,0,1,1,1,1,1,1,1,1,1,1,1,0,0],[0,0,1,1,1,1,1,1,1,1,1,1,1,0,0],[0,0,1,1,1,1,1,1,1,1,1,1,1,0,0],[0,0,1,1,1,1,1,1,1,1,1,1,1,0,0],[0,0,1,1,1,1,1,1,1,1,1,1,1,0,0],[0,0,1,1,1,1,1,1,1,1,1,1,1,0,0],[0,0,1,1,1,1,1,1,1,1,1,1,1,0,0],[0,0,1,1,1,1,1,1,1,1,1,1,1,0,0],[0,0,2,5,2,5,2,5,2,5,2,5,2,5,0],[0,2,5,2,5,2,5,2,5,2,5,2,5,0,0]]'),
(6, 'sala 2 (normalna)', 124, '2025-12-31 15:17:50', '[[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,3,3,3,3,3,3,3,3,3,3,3,0,0],[0,0,1,1,1,1,1,1,1,1,1,1,1,0,0],[0,0,1,1,1,1,1,1,1,1,1,1,1,0,0],[0,0,1,1,1,1,1,1,1,1,1,1,1,0,0],[0,0,1,1,1,1,1,1,1,1,1,1,1,0,0],[0,0,1,1,1,1,1,1,1,1,1,1,1,0,0],[0,0,1,1,1,1,1,1,1,1,1,1,1,0,0],[0,0,1,1,1,1,1,1,1,1,1,1,1,0,0],[0,0,2,5,2,5,1,2,5,2,5,2,5,0,0],[0,0,2,5,2,5,1,2,5,2,5,2,5,0,0],[2,5,2,5,2,5,2,5,2,5,2,5,2,5,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]]'),
(7, 'testowa', 4, '2026-01-03 17:16:23', '[[0,1,2,5,3,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]]');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `movies`
--

CREATE TABLE `movies` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `duration` int(11) NOT NULL COMMENT 'czas trwania w minutach',
  `release_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `youtube_link` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `movies`
--

INSERT INTO `movies` (`id`, `title`, `description`, `duration`, `release_date`, `end_date`, `image_url`, `created_at`, `youtube_link`) VALUES
(1, 'Avatar 3: Ogień i Popiół', 'Powrót na Pandorę w nowej odsłonie.', 190, '2025-12-14', '2026-01-24', 'https://fwcdn.pl/fpo/30/81/603081/8214512.3.jpg', '2025-12-01 15:44:42', 'https://www.youtube.com/watch?v=UkwsRsZbY5s'),
(2, 'Minecraft: The Movie', 'Ekranizacja kultowej gry.', 110, '2025-04-04', '2025-12-12', 'https://image.tmdb.org/t/p/w500/z6okL5p23hP7h5h3f5h3f5.jpg', '2025-12-01 15:44:42', 'https://www.youtube.com/watch?v=sRVDWDmxmPM'),
(3, 'Shrek 5', 'Ogry wracają na bagna.', 95, '2026-07-01', '2026-08-27', 'https://media.themoviedb.org/t/p/w500/967eHJFhLNRXgmodiVkGO6oUQX3.jpg', '2025-12-01 15:44:42', 'https://www.youtube.com/watch?v=Ieq1OXqH0w8'),
(4, 'Zwierzogród 2`', 'Kiedy w tętniącym życiem Zwierzogrodzie pojawia się tajemniczy gad, miasto pogrąża się w chaosie.', 108, '2025-11-23', '2026-02-15', 'https://fwcdn.pl/fpo/14/62/10051462/8180728.3.jpg', '2025-12-01 15:44:42', 'https://www.youtube.com/watch?v=nQ0rdnDCbsY'),
(5, 'Pięć koszmarnych nocy 2', 'Były ochroniarz Mike (Josh Hutcherson) i policjantka Vanessa (Elizabeth Lail) ukrywają przed 11-letnią siostrą Mike\'a, Abby (Piper Rubio), prawdę o losie jej animatronicznych przyjaciół.', 105, '2025-12-05', '2026-01-05', 'https://www.multikino.pl/-/media/multikino/images/film-and-events/2025/piec-koszmarnych-nocy-2/piec-koszmarnych-nocy-2-cut.jpg?rev=beae9b151c3543fc9fd56e457fc93fc9', '2025-12-01 15:44:42', 'https://www.youtube.com/watch?v=FgSYl_YnTUQ'),
(6, 'JUJUTSU KAISEN: Execution Shibuya Incident x The Culling Game Begins', 'Na tętniącą życiem Shibuyę, pełną tłumów szykujących się do Halloween, nagle opada kurtyna. Niezliczeni cywile znajdują się w pułapce. ', 88, '2025-12-12', '2025-12-15', 'https://www.multikino.pl/-/media/multikino/images/film-and-events/2025/jujutsu-kaisen-execution/jujutsu-kaisen-plakat-cut.jpg?rev=296675c0609e4dc0bf0e5f5616d4f322', '2025-12-01 15:44:42', 'https://www.youtube.com/watch?v=czMB5PPp3vs'),
(8, 'Diuna: Część Druga', 'Książę Paul Atryda przyjmuje przydomek Muad\'Dib i rozpoczyna duchowo-fizyczną podróż, by stać się przepowiedzianym wyzwolicielem ludu Diuny.', 166, '2026-01-13', '2026-12-22', 'https://image.tmdb.org/t/p/original/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg', '2026-01-13 21:54:12', 'https://www.youtube.com/watch?v=_YUzQa_1RCE'),
(9, 'Oppenheimer', 'Historia amerykańskiego naukowca J. Roberta Oppenheimera i jego roli w stworzeniu bomby atomowej.', 180, '2026-01-15', '2026-05-11', 'https://image.tmdb.org/t/p/original/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', '2026-01-13 21:54:12', 'https://www.youtube.com/watch?v=uYPbbksJxIg');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `pricing_rules`
--

CREATE TABLE `pricing_rules` (
  `days_before` int(11) NOT NULL,
  `price_base` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `pricing_rules`
--

INSERT INTO `pricing_rules` (`days_before`, `price_base`) VALUES
(0, 31.90),
(1, 29.90),
(2, 27.90),
(3, 23.90),
(4, 19.90);

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `screenings`
--

CREATE TABLE `screenings` (
  `id` int(11) NOT NULL,
  `movie_id` int(11) NOT NULL,
  `hall_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `cancelled` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `screenings`
--

INSERT INTO `screenings` (`id`, `movie_id`, `hall_id`, `date`, `time`, `cancelled`, `created_at`) VALUES
(2, 6, 5, '2025-12-13', '20:45:00', 0, '2025-12-12 20:33:42'),
(3, 3, 5, '2025-12-27', '23:48:00', 0, '2025-12-12 20:45:15'),
(5, 4, 5, '2025-12-31', '12:00:00', 0, '2025-12-31 15:32:48'),
(6, 1, 6, '2025-12-31', '13:00:00', 0, '2025-12-31 15:32:48'),
(7, 2, 5, '2025-12-31', '14:30:00', 0, '2025-12-31 15:32:48'),
(8, 5, 5, '2025-12-31', '17:00:00', 0, '2025-12-31 15:32:48'),
(9, 4, 6, '2025-12-31', '17:30:00', 0, '2025-12-31 15:32:48'),
(10, 1, 5, '2026-01-01', '15:00:00', 0, '2025-12-31 15:32:48'),
(11, 4, 6, '2026-01-01', '14:00:00', 0, '2025-12-31 15:32:48'),
(12, 5, 6, '2026-01-01', '16:30:00', 0, '2025-12-31 15:32:48'),
(13, 1, 5, '2026-01-01', '19:00:00', 0, '2025-12-31 15:32:48'),
(14, 5, 6, '2026-01-01', '19:30:00', 0, '2025-12-31 15:32:48'),
(15, 4, 5, '2026-01-02', '14:00:00', 0, '2025-12-31 15:32:48'),
(16, 1, 6, '2026-01-02', '15:00:00', 0, '2025-12-31 15:32:48'),
(17, 2, 5, '2026-01-02', '16:30:00', 0, '2025-12-31 15:32:48'),
(18, 5, 5, '2026-01-02', '19:00:00', 0, '2025-12-31 15:32:48'),
(19, 1, 6, '2026-01-02', '19:30:00', 0, '2025-12-31 15:32:48'),
(20, 5, 5, '2026-01-02', '21:30:00', 0, '2025-12-31 15:32:48'),
(21, 4, 5, '2026-01-03', '10:00:00', 0, '2025-12-31 15:32:48'),
(22, 4, 6, '2026-01-03', '11:00:00', 0, '2025-12-31 15:32:48'),
(23, 1, 5, '2026-01-03', '12:30:00', 0, '2025-12-31 15:32:48'),
(24, 2, 6, '2026-01-03', '13:30:00', 0, '2025-12-31 15:32:48'),
(25, 5, 6, '2026-01-03', '16:00:00', 0, '2025-12-31 15:32:48'),
(26, 1, 5, '2026-01-03', '16:30:00', 0, '2025-12-31 15:32:48'),
(27, 4, 6, '2026-01-03', '18:30:00', 0, '2025-12-31 15:32:48'),
(28, 5, 5, '2026-01-03', '20:30:00', 0, '2025-12-31 15:32:48'),
(29, 1, 6, '2026-01-03', '21:00:00', 0, '2025-12-31 15:32:48'),
(30, 4, 5, '2026-01-04', '11:00:00', 0, '2025-12-31 15:32:48'),
(31, 2, 6, '2026-01-04', '12:00:00', 0, '2025-12-31 15:32:48'),
(32, 1, 5, '2026-01-04', '13:30:00', 0, '2025-12-31 15:32:48'),
(33, 4, 6, '2026-01-04', '14:30:00', 0, '2025-12-31 15:32:48'),
(34, 5, 6, '2026-01-04', '17:00:00', 0, '2025-12-31 15:32:48'),
(35, 1, 5, '2026-01-04', '17:30:00', 0, '2025-12-31 15:32:48'),
(36, 5, 6, '2026-01-04', '20:00:00', 0, '2025-12-31 15:32:48'),
(37, 4, 5, '2026-01-05', '15:00:00', 0, '2025-12-31 15:32:48'),
(38, 1, 6, '2026-01-05', '16:00:00', 0, '2025-12-31 15:32:48'),
(39, 5, 5, '2026-01-05', '17:30:00', 0, '2025-12-31 15:32:48'),
(40, 4, 5, '2026-01-05', '20:00:00', 0, '2025-12-31 15:32:48'),
(41, 1, 6, '2026-01-05', '20:00:00', 0, '2025-12-31 15:32:48'),
(42, 4, 6, '2026-01-06', '12:00:00', 0, '2025-12-31 15:32:48'),
(43, 1, 5, '2026-01-06', '13:00:00', 0, '2025-12-31 15:32:48'),
(44, 2, 6, '2026-01-06', '14:30:00', 0, '2025-12-31 15:32:48'),
(45, 5, 6, '2026-01-06', '17:00:00', 0, '2025-12-31 15:32:48'),
(46, 1, 5, '2026-01-06', '17:00:00', 0, '2025-12-31 15:32:48'),
(47, 4, 6, '2026-01-06', '19:30:00', 0, '2025-12-31 15:32:48'),
(48, 5, 5, '2026-01-06', '21:00:00', 0, '2025-12-31 15:32:48'),
(49, 4, 6, '2026-01-08', '17:20:00', 0, '2026-01-06 21:38:02'),
(50, 4, 5, '2026-01-07', '01:30:00', 0, '2026-01-07 01:34:25'),
(51, 4, 6, '2026-01-07', '21:37:00', 0, '2026-01-07 01:34:40'),
(52, 4, 6, '2026-01-10', '20:37:00', 0, '2026-01-10 17:34:52'),
(63, 1, 5, '2026-01-13', '14:30:00', 0, '2026-01-13 21:59:38'),
(64, 8, 5, '2026-01-13', '18:00:00', 0, '2026-01-13 21:59:38'),
(65, 9, 5, '2026-01-13', '21:30:00', 0, '2026-01-13 21:59:38'),
(66, 2, 6, '2026-01-13', '15:00:00', 0, '2026-01-13 21:59:38'),
(67, 4, 6, '2026-01-13', '17:30:00', 0, '2026-01-13 21:59:38'),
(68, 5, 6, '2026-01-13', '20:00:00', 0, '2026-01-13 21:59:38'),
(69, 3, 5, '2026-01-14', '14:00:00', 0, '2026-01-13 21:59:38'),
(70, 1, 5, '2026-01-14', '16:00:00', 0, '2026-01-13 21:59:38'),
(71, 6, 5, '2026-01-14', '20:00:00', 0, '2026-01-13 21:59:38'),
(73, 8, 6, '2026-01-14', '19:30:00', 0, '2026-01-13 21:59:38'),
(74, 4, 5, '2026-01-15', '15:00:00', 0, '2026-01-13 21:59:38'),
(75, 5, 5, '2026-01-15', '17:30:00', 0, '2026-01-13 21:59:38'),
(76, 1, 5, '2026-01-15', '20:00:00', 0, '2026-01-13 21:59:38'),
(77, 2, 6, '2026-01-15', '14:30:00', 0, '2026-01-13 21:59:38'),
(78, 3, 6, '2026-01-15', '17:00:00', 0, '2026-01-13 21:59:38'),
(79, 6, 6, '2026-01-15', '19:00:00', 0, '2026-01-13 21:59:38'),
(80, 9, 5, '2026-01-13', '23:00:00', 0, '2026-01-13 22:00:56'),
(81, 8, 6, '2026-01-13', '23:00:00', 0, '2026-01-13 22:01:58');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('user','employee','admin') NOT NULL DEFAULT 'user',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expires` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `created_at`, `reset_token`, `reset_token_expires`) VALUES
(2, 'karol', 'rpz42kw@tablica.pl', '$2b$10$/l17WYXiKofqwoojkpuaJ.uSaxa6ZgKPweozWeZRaiFYKoZra.8bO', 'user', '2025-12-01 15:13:19', NULL, NULL),
(3, 'admin', 'admin@admin', '$2b$10$nQR3JtdHx1fr.WAH5vioau12tCX9eMlfYWauZcx5IbBYkbu96QYg2', 'admin', '2025-12-01 15:13:56', NULL, NULL),
(4, 'pracownik', 'jasiek@pracownik', '$2b$10$kBbWcJdL43edtj07lyLqVuRz8EmOSu02v8YuVUeo7VALXFu/mhtm.', 'employee', '2025-12-10 00:08:25', NULL, NULL),
(5, 'karol', 'wet_rat@o2.pl', '$2b$10$jSbmzRgb3cDuk2w0XIUr1.BNVFe.don07Emy..qxMNZkosEOvubNW', 'user', '2026-01-03 21:27:27', NULL, NULL);

--
-- Indeksy dla zrzutów tabel
--

--
-- Indeksy dla tabeli `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_screening_seat` (`screening_id`,`seat_number`,`status`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `screening_id` (`screening_id`);

--
-- Indeksy dla tabeli `halls`
--
ALTER TABLE `halls`
  ADD PRIMARY KEY (`id`),
  ADD KEY `name` (`name`);

--
-- Indeksy dla tabeli `movies`
--
ALTER TABLE `movies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `title` (`title`);

--
-- Indeksy dla tabeli `pricing_rules`
--
ALTER TABLE `pricing_rules`
  ADD PRIMARY KEY (`days_before`);

--
-- Indeksy dla tabeli `screenings`
--
ALTER TABLE `screenings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `date` (`date`),
  ADD KEY `movie_id` (`movie_id`),
  ADD KEY `hall_id` (`hall_id`);

--
-- Indeksy dla tabeli `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `role` (`role`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;

--
-- AUTO_INCREMENT for table `halls`
--
ALTER TABLE `halls`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `movies`
--
ALTER TABLE `movies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `screenings`
--
ALTER TABLE `screenings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=82;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `fk_bookings_screening` FOREIGN KEY (`screening_id`) REFERENCES `screenings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_bookings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `screenings`
--
ALTER TABLE `screenings`
  ADD CONSTRAINT `fk_screenings_hall` FOREIGN KEY (`hall_id`) REFERENCES `halls` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_screenings_movie` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
